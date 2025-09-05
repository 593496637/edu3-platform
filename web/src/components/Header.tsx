import { Home, BookOpen, User, Coins, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const navigation = [
  { name: "首页", href: "/", icon: Home },
  { name: "代币兑换", href: "/exchange", icon: Coins },
  { name: "讲师中心", href: "/instructor", icon: Users },
  { name: "我的课程", href: "/my-courses", icon: BookOpen },
  { name: "个人中心", href: "/profile", icon: User },
];

export default function Header() {
  const location = useLocation();

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EDU3</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex md:space-x-8">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center space-x-1 px-1 pt-1 text-sm font-medium ${
                    isActive
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Connect Button */}
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden">
        <div className="space-y-1 pb-3 pt-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-2 text-base font-medium ${
                  isActive
                    ? "border-r-4 border-blue-500 bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
