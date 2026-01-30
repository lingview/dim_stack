import {
    FileText, User, MessageCircle, Eye, Edit, File, Upload,
    Palette, Plug, UserPlus, RefreshCcw, BarChart2, Book,
    Settings, Wrench, Image, Link as LinkIcon, Clipboard, Users,
    Database, ShoppingCart, Package, CheckSquare, List,
    Tags, Folder
} from 'lucide-react';

export function getIcon(iconName) {
    switch (iconName) {
        case 'article': return <FileText className="w-5 h-5" />;
        case 'user': return <User className="w-5 h-5" />;
        case 'comment': return <MessageCircle className="w-5 h-5" />;
        case 'view':
        case 'eye': return <Eye className="w-5 h-5" />;
        case 'edit': return <Edit className="w-5 h-5" />;
        case 'page': return <File className="w-5 h-5" />;
        case 'upload': return <Upload className="w-5 h-5" />;
        case 'theme': return <Palette className="w-5 h-5" />;
        case 'plugin': return <Plug className="w-5 h-5" />;
        case 'add-user': return <UserPlus className="w-5 h-5" />;
        case 'refresh': return <RefreshCcw className="w-5 h-5" />;
        case 'dashboard': return <BarChart2 className="w-5 h-5" />;
        case 'content': return <Book className="w-5 h-5" />;
        case 'appearance':
        case 'settings':
        case 'system': return <Settings className="w-5 h-5" />;
        case 'tools': return <Wrench className="w-5 h-5" />;
        case 'media': return <Image className="w-5 h-5" />;
        case 'link': return <LinkIcon className="w-5 h-5" />;
        case 'menu':
        case 'menus': return <List className="w-5 h-5" />;
        case 'users': return <Users className="w-5 h-5" />;
        case 'backup': return <Database className="w-5 h-5" />;
        case 'marketplace': return <ShoppingCart className="w-5 h-5" />;
        case 'migrate': return <Package className="w-5 h-5" />;
        case 'overview': return <BarChart2 className="w-5 h-5" />;
        case 'review': return <CheckSquare className="w-5 h-5" />;
        case 'info': return <Clipboard className="w-5 h-5" />;
        case 'update': return <RefreshCcw className="w-5 h-5" />;
        case 'tag': return <Tags className="w-5 h-5" />;
        case 'category': return <Folder className="w-5 h-5" />;
        default: return <File className="w-5 h-5" />;
    }
}

export function getIconColor(iconName) {
    switch (iconName) {
        case 'article': return 'bg-blue-500';
        case 'user': return 'bg-purple-500';
        case 'comment': return 'bg-green-500';
        case 'view':
        case 'eye': return 'bg-yellow-500';
        case 'edit': return 'bg-green-500';
        case 'page': return 'bg-indigo-500';
        case 'upload': return 'bg-orange-500';
        case 'theme': return 'bg-pink-500';
        case 'plugin': return 'bg-purple-500';
        case 'add-user': return 'bg-green-500';
        case 'refresh':
        case 'update': return 'bg-blue-500';
        case 'dashboard':
        case 'overview': return 'bg-blue-500';
        case 'content':
        case 'review': return 'bg-teal-500';
        case 'appearance':
        case 'settings':
        case 'system': return 'bg-gray-700';
        case 'tools': return 'bg-yellow-500';
        case 'menu':
        case 'menus': return 'bg-indigo-500';
        case 'link': return 'bg-teal-500';
        case 'users': return 'bg-purple-500';
        case 'backup': return 'bg-red-500';
        case 'marketplace': return 'bg-emerald-500';
        case 'migrate': return 'bg-amber-500';
        case 'info': return 'bg-blue-500';
        case 'tag': return 'bg-yellow-500';
        case 'category': return 'bg-purple-500';
        default: return 'bg-gray-500';
    }
}