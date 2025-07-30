const TestJoin = () => {
  const currentUrl = window.location.href;
  const pathParts = window.location.pathname.split('/');
  const token = pathParts[pathParts.length - 1];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Test Join Page</h1>
        <p>URL actuelle: {currentUrl}</p>
        <p>Token extrait: {token}</p>
        <p>Path parts: {pathParts.join(' / ')}</p>
      </div>
    </div>
  );
};

export default TestJoin;