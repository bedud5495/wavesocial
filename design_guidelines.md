# Design Guidelines: SWAVE - Decentralized Social Platform

## Design Approach

**Reference-Based**: Primary inspiration from Twitter/X's clean information architecture combined with modern Web3 aesthetics (Uniswap, OpenSea). Focus on familiar social media patterns while integrating blockchain elements seamlessly.

## Core Design Principles

1. **Familiar Yet Fresh**: Leverage Twitter's proven UX patterns while adding Web3-native visual identity
2. **Token Integration**: Make SWAVE tokens and rewards feel integral, not grafted on
3. **Information Clarity**: Prioritize readability and quick scanning for timeline content
4. **Trust Signals**: Emphasize verification, wallet connection, and blockchain transparency

---

## Typography System

**Primary Font**: Inter (Google Fonts) - clean, technical feel perfect for Web3
**Secondary Font**: JetBrains Mono (Google Fonts) - for wallet addresses, token amounts

**Hierarchy**:
- Headlines (Profile names, post headers): 600 weight, 18-20px
- Body text (Posts, descriptions): 400 weight, 15-16px
- Metadata (timestamps, counts): 400 weight, 13-14px
- Token amounts: JetBrains Mono, 500 weight, 14-16px
- Wallet addresses: JetBrains Mono, 400 weight, 12px (truncated)

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 3, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section spacing: gap-4, gap-6
- Page margins: px-4, py-6, py-8

**Grid Structure**:
- Desktop: Three-column layout (Sidebar 280px | Feed 600px | Widget Panel 350px)
- Tablet: Two-column (Collapsed sidebar | Feed)
- Mobile: Single column, full width

**Container Strategy**:
- Max-width: 1280px for entire app
- Feed content: max-w-2xl centered
- Cards and posts: full container width with internal padding

---

## Component Library

### Navigation & Structure

**Left Sidebar** (Desktop):
- Logo/Brand at top with SWAVE icon
- Navigation menu: Home, Explore, Notifications, Profile, Wallet
- Token balance display (prominent, always visible)
- "Create Post" primary CTA button
- Footer: Settings, Help links

**Top Bar** (Mobile):
- Logo left, Wallet/Menu right
- Bottom tab navigation for main sections

**Right Panel** (Desktop):
- Wallet connection status card
- Token balance & rewards summary
- Trending topics/posts
- Suggested users to follow
- Ad space for promoted posts

### Post Components

**Post Card**:
- User avatar (48px, circular)
- Username, verification badge, timestamp in single line
- Post content (text + IPFS image preview if attached)
- Engagement row: Like count + button, Repost count + button, Token rewards earned badge
- Subtle border, shadow on hover

**Create Post Modal/Card**:
- Larger text area (min 3 lines)
- IPFS upload button for images (icon + "Add Photo")
- Character count if implementing limits
- Token reward preview: "Earn 1,000 SWAVE for this post"
- Post button (primary, prominent)

### Profile Components

**Profile Header**:
- Cover image area (IPFS uploaded, 200px height)
- Avatar (120px, overlapping cover by 50%)
- Verification badge (if verified, 100k token stake indicator)
- Username, wallet address (truncated with copy button)
- Bio text area
- Stats row: Posts count, Followers, Following, Tokens Earned
- Action buttons: Follow/Unfollow, Edit Profile, Tip Tokens

**Profile Tabs**:
- Posts, Replies, Likes, NFTs (if applicable)

### Web3-Specific Components

**Wallet Connection Card**:
- Status indicator (connected/disconnected)
- Wallet address with copy button
- Network indicator (opBNB Testnet badge)
- Disconnect button
- Token balance prominently displayed

**Token Reward Badge**:
- Inline with posts showing: "+1,000 SWAVE" with icon
- Milestone celebration when reaching like milestones
- Referral reward notifications

**Verification Badge**:
- Checkmark icon in brand color
- Tooltip: "Verified - 100k SWAVE staked"

**Ad Post Indicator**:
- "Promoted" label
- Subtle visual differentiation (lighter background or border)

### Forms & Inputs

**Standard Input Fields**:
- Single border, rounded corners (rounded-lg)
- Focus state with border highlight
- Placeholder text in muted color
- Labels above inputs

**Buttons**:
- Primary: Solid background, medium weight text, px-6 py-3
- Secondary: Outlined, transparent background
- Icon buttons: Square, p-2, hover background
- Disabled state: Reduced opacity

### Feed Components

**Timeline**:
- Infinite scroll with loading indicator
- "New posts" notification bar when new content available
- Empty state: "Follow users to see posts"

**Like Milestone Celebration**:
- Modal/toast when post reaches 1k, 2k, etc. likes
- Animated token icon
- "Congrats! +1,000 SWAVE earned"

---

## Interaction Patterns

**Micro-interactions** (minimal):
- Like button: Heart fill animation
- Follow button: State change with brief scale
- Token reward: Subtle shine/glow on earn events
- Wallet connection: Pulse on status change

**Navigation**:
- Instant page transitions (no full reload)
- Active state highlighting in sidebar
- Breadcrumbs for nested views (user profile from feed)

---

## Images

**Hero Section**: NO traditional hero. App opens directly to feed (Twitter-style).

**Profile Covers**: Full-width cover images (user-uploaded via IPFS), 1500x500px recommended
**Post Images**: Inline within post cards, max-width with rounded corners, IPFS-sourced
**Avatars**: Circular, IPFS-sourced or default generated patterns
**Placeholders**: Use subtle gradients or patterns for missing images, never blank spaces

---

## Icons

**Library**: Heroicons (via CDN)
- Social actions: heart, repeat, message
- Navigation: home, bell, user, wallet
- Web3: wallet icon, token icon (custom SWAVE logo allowed)

---

## Key UX Considerations

1. **Gas Fee Transparency**: Show estimated gas before transactions
2. **Loading States**: Blockchain transactions need clear pending/confirmation states
3. **Error Handling**: Wallet rejections, insufficient tokens - clear messaging
4. **Referral Visualization**: Show referral tree/network when applicable
5. **Token Economics**: Always visible balance, clear reward pathways
6. **IPFS Loading**: Show progressive loading for images from IPFS

---

This design creates a familiar social experience while seamlessly integrating Web3 features, making token rewards and blockchain interactions feel natural rather than bolted-on.