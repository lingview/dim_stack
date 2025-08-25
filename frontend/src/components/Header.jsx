import { fakeData } from '../Api.jsx';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
      <header className="bg-white shadow transition-colors duration-200 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-400">{fakeData.siteInfo.title}</h1>
            </div>

            <nav className="hidden md:block">
              <ul className="flex space-x-8">
                {fakeData.navItems.map((item) => (
                    <li key={item.id}>
                      <a
                          href={item.href}
                          className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
                      >
                        {item.name}
                      </a>
                    </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button className="md:hidden text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button className="hidden md:block bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200">
                登录
              </button>
            </div>
          </div>
        </div>
      </header>
  );
}
