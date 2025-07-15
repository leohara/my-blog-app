export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-8 pt-24">
      <h1 className="text-4xl font-bold mb-6">Welcome to My Blog</h1>
      <p className="text-xl text-gray-600 mb-8">
        A place to share thoughts, ideas, and experiences.
      </p>
      <div className="space-y-4">
        <section className="p-6 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-3">Recent Updates</h2>
          <p className="text-gray-600">
            Check out our latest articles and stay updated with new content.
          </p>
        </section>
      </div>
    </div>
  );
}
