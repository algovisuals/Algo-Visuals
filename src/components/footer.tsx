const Footer = () => {
  return (
    <footer className="bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Algo-Visualizer
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
