import { fakeData } from '../api';

export default function Hero() {
    const { hero } = fakeData;

    return (
        <div className="relative bg-gray-900">
            <div className="absolute inset-0">
                <img
                    className="w-full h-full object-cover"
                    src={hero.image}
                    alt="头图"
                />
            </div>

            <a href={hero.ctaLink} className="relative block container mx-auto px-4 py-24 md:py-32">
                <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 hover:text-blue-300 transition-colors duration-200">
                        {hero.title}
                    </h1>
                    <p className="text-xl text-gray-200 mb-8 hover:text-white transition-colors duration-200">
                        {hero.subtitle}
                    </p>
                </div>
            </a>
        </div>
    );
}
