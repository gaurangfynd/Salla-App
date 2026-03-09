import svgs from "../../common/assets/images/auto_gen/svgs";
import type { TipItem } from "../../types/aiAgent";


export const benefits: {
    id: number;
    title: string;
    subtitle: string;
    icon: string;
}[] = [
        {
            id: 1,
            title: "Automate 24/7 Customer Support",
            subtitle: "Always-on assistance handles queries and boosts customer satisfaction.",
            icon: "ic_time",
        },
        {
            id: 2,
            title: "Personalized Shopping Experiences",
            subtitle: "Offers tailored product recommendations to increase sales quickly.",
            icon: "ic_cart",
        },
        {
            id: 3,
            title: "Lead Generation & Qualification",
            subtitle: "Collect leads, qualify prospects, and assist with sales inquiries effortlessly.",
            icon: "ic_consumption_high",
        },
        {
            id: 4,
            title: "Post Order Support",
            subtitle: "Simplifies order tracking and post-purchase customer interactions efficiently.",
            icon: "ic_headphones",
        },
        {
            id: 5,
            title: "Quick & Easy Human-Handover",
            subtitle: "Seamlessly transfers complex queries to human agents quickly.",
            icon: "ic_sms_group",
        },
        {
            id: 6,
            title: "AI-Driven Insights",
            subtitle: "Provides actionable data for improved marketing strategies always.",
            icon: "ic_graph_table",
        },
    ];

export const aiProviders: { id: number; icon: string; name: string }[] = [
    {
        id: 1,
        icon: "ic_gpt",
        name: "Open AI",
    },
    {
        id: 2,
        icon: "ic_meta",
        name: "Meta Lama",
    },
    {
        id: 3,
        icon: "ic_gemini",
        name: "Gemini",
    },
    {
        id: 4,
        icon: "ic_deepseek",
        name: "Deepseek",
    },
    {
        id: 5,
        icon: "ic_claude",
        name: "Anthropic",
    },
];

export const channels: {
    id: number;
    icon: keyof typeof svgs;
    name: string;
}[] = [
        { id: 1, icon: "ic_web_browser_mobile", name: "Web Page" },
        {
            id: 2,
            icon: "ic_call_clear",
            name: "Voice Call",
        },
        {
            id: 3,
            icon: "ic_mobile_devices",
            name: "Mobile Apps",
        },
        {
            id: 4,
            icon: "ic_call",
            name: "WhatsApp",
        },
    ];

export const tips: TipItem[] = [
    {
        icon: "ic_face_filter",
        title: "Adjust ai agent's Response & Persona",
        description: "Fine-tune your AI Agent's tone and behavior to align with your brand",
    },
    {
        icon: "ic_server_cloud",
        title: "Add Data Sources",
        description: "Provide relevant data to improve your AI Agent's accuracy and responses",
    },
    {
        icon: "ic_colour_palette",
        title: "Customize Appearance",
        description: "Personalize your AI Agent's look and feel to match your brand identity",
    },
    {
        icon: "ic_web_browser_mobile",
        title: "Deploy on multiple surfaces",
        description: "Enable your AI Agent on key platforms to engage customers everywhere",
    },
];

export const surfaceMapping: Record<string, string> = {
    "Website Widget": "web",
    "Public Webpage": "hosted-web",
    WhatsApp: "whatsapp",
    "Mobile Apps": "mobile",
    "AI Voice Call": "call",
};

export const integrationOptions: {
    icon: keyof typeof svgs;
    title: string;
    description: string;
    setupEnabled: boolean;
}[] = [
        {
            icon: "ic_web_browser_mobile",
            title: "Website Widget",
            description: "Manage which pages your AI Agent will be available on.",
            setupEnabled: true,
        },
        {
            icon: "ic_globe",
            title: "Public Webpage",
            description: "Enable AI Agent on public-facing web pages for easy access.",
            setupEnabled: false,
        },
        {
            icon: "ic_call",
            title: "WhatsApp",
            description: "Integrate AI Agent with WhatsApp for instant messaging support.",
            setupEnabled: false,
        },
        {
            icon: "ic_mobile_devices",
            title: "Mobile Apps",
            description: "Deploy AI Agent within your mobile applications for seamless interactions.",
            setupEnabled: false,
        },
        {
            icon: "ic_call_clear",
            title: "AI Voice Call",
            description: "Enable voice-based interactions with AI Agent for a hands-free experience.",
            setupEnabled: false,
        },
    ];

export const NAVIGATORS = {
    "about-us": {
        name: "About Us",
        slug: "about-us",
    },
    addresses: {
        name: "Saved Addresses",
        slug: "addresses",
    },
    blog: {
        name: "Blog",
        slug: "blog",
    },
    brands: {
        name: "Brands",
        slug: "brands",
    },
    cards: {
        name: "Saved Cards",
        slug: "cards",
    },
    cart: {
        name: "Cart",
        slug: "cart",
    },
    categories: {
        name: "Categories",
        slug: "categories",
    },
    brand: {
        name: "Brand",
        slug: "brand",
    },
    category: {
        name: "Category",
        slug: "category",
    },
    collection: {
        name: "Collection",
        slug: "collection",
    },
    collections: {
        name: "Collections",
        slug: "collections",
    },
    "contact-us": {
        name: "Contact Us",
        slug: "contact-us",
    },
    external: {
        name: "External Link",
        slug: "external",
    },
    custom: {
        name: "Custom theme link",
        slug: "custom",
    },
    faq: {
        name: "FAQ",
        slug: "faq",
    },
    freshchat: {
        name: "Chat by Freshchat",
        slug: "freshchat",
    },
    home: {
        name: "Home",
        slug: "home",
    },
    "notification-settings": {
        name: "Notification Settings",
        slug: "notification-settings",
    },
    orders: {
        name: "Orders",
        slug: "orders",
    },
    page: {
        name: "Page",
        slug: "page",
    },
    policy: {
        name: "Privacy Policy",
        slug: "policy",
    },
    product: {
        name: "Product",
        slug: "product",
    },
    "product-request": {
        name: "Product Request",
        slug: "product-request",
    },
    products: {
        name: "Products",
        slug: "products",
    },
    profile: {
        name: "Profile",
        slug: "profile",
    },
    "profile-order-shipment": {
        name: "Profile Orders Shipment",
        slug: "profile-order-shipment",
    },
    "profile-basic": {
        name: "Basic Profile",
        slug: "profile-basic",
    },
    "profile-company": {
        name: "Profile Company",
        slug: "profile-company",
    },
    "profile-emails": {
        name: "Profile Emails",
        slug: "profile-emails",
    },
    "profile-phones": {
        name: "Profile Phones",
        slug: "profile-phones",
    },
    "rate-us": {
        name: "Rate Us",
        slug: "rate-us",
    },
    "refer-earn": {
        name: "Refer & Earn",
        slug: "refer-earn",
    },
    settings: {
        name: "Settings",
        slug: "settings",
    },
    "shared-cart": {
        name: "Shared Cart",
        slug: "shared-cart",
    },
    tnc: {
        name: "Terms and Conditions",
        slug: "tnc",
    },
    "track-order": {
        name: "Track Order",
        slug: "track-order",
    },
    wishlist: {
        name: "Wishlist",
        slug: "wishlist",
    },
    sections: {
        name: "Sections",
        slug: "sections",
    },
    form: {
        name: "Form",
        slug: "form",
    },
    "cart-delivery": {
        name: "Cart Delivery",
        slug: "cart-delivery",
    },
    "cart-payment": {
        name: "Cart Payment Information",
        slug: "cart-payment",
    },
    "cart-review": {
        name: "Cart Order Review",
        slug: "cart-review",
    },
    login: {
        name: "Login",
        slug: "login",
    },
    register: {
        name: "Register",
        slug: "register",
    },
    "shipping-policy": {
        name: "Shipping Policy",
        slug: "shipping-policy",
    },
    "return-policy": {
        name: "Return Policy",
        slug: "return-policy",
    },
    "order-status": {
        name: "Order Status",
        slug: "order-status",
    },
    "locate-us": {
        name: "Locate Us",
        slug: "locate-us",
    },
};
