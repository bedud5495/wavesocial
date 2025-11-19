// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./SWAVEToken.sol";

contract SocialWave is ReentrancyGuard {
    SWAVEToken public swaveToken;
    
    uint256 public constant POST_REWARD = 1000 * 10**18;
    uint256 public constant LIKE_MILESTONE_REWARD = 1000 * 10**18;
    uint256 public constant AD_COST = 1000 * 10**18;
    uint256 public constant VERIFICATION_STAKE = 100000 * 10**18;
    
    uint256[5] public REFERRAL_REWARDS = [
        100000 * 10**18,
        10000 * 10**18,
        1000 * 10**18,
        100 * 10**18,
        10 * 10**18
    ];
    
    struct User {
        address walletAddress;
        string username;
        string profileIPFSHash;
        address referrer;
        bool isVerified;
        uint256 verificationStake;
        uint256 totalEarned;
        uint256 followerCount;
        uint256 followingCount;
        uint256 postCount;
        bool exists;
    }
    
    struct Post {
        uint256 id;
        address author;
        string contentIPFSHash;
        uint256 timestamp;
        uint256 likeCount;
        uint256 totalRewards;
        bool isAd;
        bool exists;
    }
    
    uint256 public nextPostId = 1;
    uint256 public totalUsers;
    
    mapping(address => User) public users;
    mapping(uint256 => Post) public posts;
    mapping(uint256 => mapping(address => bool)) public postLikes;
    mapping(address => mapping(address => bool)) public following;
    mapping(address => address[]) public userFollowers;
    mapping(address => address[]) public userFollowing;
    mapping(address => uint256[]) public userPosts;
    
    event UserRegistered(address indexed user, string username, address indexed referrer);
    event PostCreated(uint256 indexed postId, address indexed author, string ipfsHash, bool isAd);
    event PostLiked(uint256 indexed postId, address indexed liker, uint256 newLikeCount);
    event PostUnliked(uint256 indexed postId, address indexed unliker, uint256 newLikeCount);
    event UserFollowed(address indexed follower, address indexed followed);
    event UserUnfollowed(address indexed follower, address indexed unfollowed);
    event RewardClaimed(address indexed user, uint256 amount, string reason);
    event UserVerified(address indexed user, uint256 stake);
    event VerificationRevoked(address indexed user, uint256 refund);
    event ReferralRewardPaid(address indexed referrer, address indexed referee, uint256 level, uint256 amount);
    
    constructor(address _swaveToken) {
        swaveToken = SWAVEToken(_swaveToken);
    }
    
    modifier onlyRegistered() {
        require(users[msg.sender].exists, "User not registered");
        _;
    }
    
    function registerUser(string memory _username, string memory _profileIPFSHash, address _referrer) external {
        require(!users[msg.sender].exists, "User already registered");
        require(bytes(_username).length > 0, "Username required");
        
        if (_referrer != address(0)) {
            require(users[_referrer].exists, "Referrer must be registered");
            require(_referrer != msg.sender, "Cannot refer yourself");
        }
        
        users[msg.sender] = User({
            walletAddress: msg.sender,
            username: _username,
            profileIPFSHash: _profileIPFSHash,
            referrer: _referrer,
            isVerified: false,
            verificationStake: 0,
            totalEarned: 0,
            followerCount: 0,
            followingCount: 0,
            postCount: 0,
            exists: true
        });
        
        totalUsers++;
        
        if (_referrer != address(0)) {
            _distributeReferralRewards(_referrer, msg.sender);
        }
        
        emit UserRegistered(msg.sender, _username, _referrer);
    }
    
    function _distributeReferralRewards(address _referrer, address _newUser) private {
        address currentReferrer = _referrer;
        
        for (uint256 i = 0; i < 5; i++) {
            if (currentReferrer == address(0) || !users[currentReferrer].exists) {
                break;
            }
            
            uint256 reward = REFERRAL_REWARDS[i];
            swaveToken.mint(currentReferrer, reward);
            users[currentReferrer].totalEarned += reward;
            
            emit ReferralRewardPaid(currentReferrer, _newUser, i + 1, reward);
            
            currentReferrer = users[currentReferrer].referrer;
        }
    }
    
    function createPost(string memory _contentIPFSHash, bool _isAd) external onlyRegistered nonReentrant {
        require(bytes(_contentIPFSHash).length > 0, "Content hash required");
        
        if (_isAd) {
            require(swaveToken.transferFrom(msg.sender, address(this), AD_COST), "Ad payment failed");
        }
        
        uint256 postId = nextPostId++;
        
        posts[postId] = Post({
            id: postId,
            author: msg.sender,
            contentIPFSHash: _contentIPFSHash,
            timestamp: block.timestamp,
            likeCount: 0,
            totalRewards: 0,
            isAd: _isAd,
            exists: true
        });
        
        userPosts[msg.sender].push(postId);
        users[msg.sender].postCount++;
        
        if (!_isAd) {
            swaveToken.mint(msg.sender, POST_REWARD);
            posts[postId].totalRewards = POST_REWARD;
            users[msg.sender].totalEarned += POST_REWARD;
            emit RewardClaimed(msg.sender, POST_REWARD, "Post creation");
        }
        
        emit PostCreated(postId, msg.sender, _contentIPFSHash, _isAd);
    }
    
    function likePost(uint256 _postId) external onlyRegistered {
        require(posts[_postId].exists, "Post does not exist");
        require(!postLikes[_postId][msg.sender], "Already liked");
        require(posts[_postId].author != msg.sender, "Cannot like own post");
        
        postLikes[_postId][msg.sender] = true;
        posts[_postId].likeCount++;
        
        uint256 newLikeCount = posts[_postId].likeCount;
        
        if (newLikeCount % 1000 == 0 && newLikeCount > 0) {
            address author = posts[_postId].author;
            swaveToken.mint(author, LIKE_MILESTONE_REWARD);
            posts[_postId].totalRewards += LIKE_MILESTONE_REWARD;
            users[author].totalEarned += LIKE_MILESTONE_REWARD;
            emit RewardClaimed(author, LIKE_MILESTONE_REWARD, "Like milestone");
        }
        
        emit PostLiked(_postId, msg.sender, newLikeCount);
    }
    
    function unlikePost(uint256 _postId) external onlyRegistered {
        require(posts[_postId].exists, "Post does not exist");
        require(postLikes[_postId][msg.sender], "Not liked");
        
        postLikes[_postId][msg.sender] = false;
        posts[_postId].likeCount--;
        
        emit PostUnliked(_postId, msg.sender, posts[_postId].likeCount);
    }
    
    function followUser(address _user) external onlyRegistered {
        require(users[_user].exists, "User does not exist");
        require(_user != msg.sender, "Cannot follow yourself");
        require(!following[msg.sender][_user], "Already following");
        
        following[msg.sender][_user] = true;
        userFollowers[_user].push(msg.sender);
        userFollowing[msg.sender].push(_user);
        
        users[_user].followerCount++;
        users[msg.sender].followingCount++;
        
        emit UserFollowed(msg.sender, _user);
    }
    
    function unfollowUser(address _user) external onlyRegistered {
        require(following[msg.sender][_user], "Not following");
        
        following[msg.sender][_user] = false;
        
        _removeFromArray(userFollowers[_user], msg.sender);
        _removeFromArray(userFollowing[msg.sender], _user);
        
        users[_user].followerCount--;
        users[msg.sender].followingCount--;
        
        emit UserUnfollowed(msg.sender, _user);
    }
    
    function verifyProfile() external onlyRegistered nonReentrant {
        require(!users[msg.sender].isVerified, "Already verified");
        require(swaveToken.transferFrom(msg.sender, address(this), VERIFICATION_STAKE), "Stake transfer failed");
        
        users[msg.sender].isVerified = true;
        users[msg.sender].verificationStake = VERIFICATION_STAKE;
        
        emit UserVerified(msg.sender, VERIFICATION_STAKE);
    }
    
    function revokeVerification() external onlyRegistered nonReentrant {
        require(users[msg.sender].isVerified, "Not verified");
        
        uint256 refund = users[msg.sender].verificationStake;
        users[msg.sender].isVerified = false;
        users[msg.sender].verificationStake = 0;
        
        require(swaveToken.transfer(msg.sender, refund), "Refund failed");
        
        emit VerificationRevoked(msg.sender, refund);
    }
    
    function updateProfile(string memory _profileIPFSHash) external onlyRegistered {
        users[msg.sender].profileIPFSHash = _profileIPFSHash;
    }
    
    function _removeFromArray(address[] storage array, address value) private {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == value) {
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
    }
    
    function getUserPosts(address _user) external view returns (uint256[] memory) {
        return userPosts[_user];
    }
    
    function getUserFollowers(address _user) external view returns (address[] memory) {
        return userFollowers[_user];
    }
    
    function getUserFollowing(address _user) external view returns (address[] memory) {
        return userFollowing[_user];
    }
    
    function isFollowing(address _follower, address _followed) external view returns (bool) {
        return following[_follower][_followed];
    }
    
    function hasLikedPost(uint256 _postId, address _user) external view returns (bool) {
        return postLikes[_postId][_user];
    }
    
    function getUser(address _userAddress) external view returns (User memory) {
        return users[_userAddress];
    }
    
    function getPost(uint256 _postId) external view returns (Post memory) {
        return posts[_postId];
    }
}
