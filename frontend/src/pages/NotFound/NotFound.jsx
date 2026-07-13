import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-8">
      <h1 className="text-6xl font-bold text-dusty-rose mb-4 font-serif">404</h1>
      <h2 className="text-2xl font-serif text-deep-brown mb-6">Page Not Found</h2>
      <p className="text-warm-gray mb-10 max-w-md">
        The story you are looking for seems to have been misplaced. Let's get you back to the library.
      </p>
      <Link to="/" className="bg-deep-brown text-warm-ivory px-8 py-3 rounded-full hover:bg-deep-brown/90 transition-colors">
        Return Home
      </Link>
    </div>
  );
};

export default NotFound;
