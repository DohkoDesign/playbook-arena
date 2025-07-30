const SimpleJoinTest = () => {
  console.log("✅ SimpleJoinTest loaded!");
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Test de Routing</h1>
        <p>Si vous voyez cette page, le routing fonctionne !</p>
        <p>URL: {window.location.href}</p>
        <p>Token: {window.location.pathname.split('/').pop()}</p>
      </div>
    </div>
  );
};

export default SimpleJoinTest;