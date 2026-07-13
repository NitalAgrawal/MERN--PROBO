const Landing = () => {
  return (
    <div className="max-w-7xl mx-auto px-8 py-20 text-center">
      <h1 className="text-5xl md:text-7xl font-bold mb-6">
        Every Story Deserves a <span className="italic text-dusty-rose">Beautiful Book</span>.
      </h1>
      <p className="text-lg md:text-xl text-warm-gray max-w-2xl mx-auto mb-10">
        Transform memories, voice notes, and photos into beautifully written books powered by AI.
      </p>
      
      <div className="flex justify-center gap-4">
        <button className="bg-deep-brown text-warm-ivory px-8 py-3 rounded-full hover:bg-deep-brown/90 transition-colors shadow-soft">
          Create Your Story
        </button>
        <button className="bg-transparent text-deep-brown border border-deep-brown/20 px-8 py-3 rounded-full hover:bg-deep-brown/5 transition-colors">
          Explore Stories
        </button>
      </div>
    </div>
  );
};

export default Landing;
