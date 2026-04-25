export default function CompareLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-10">
          <div className="h-12 w-64 bg-gray-200 dark:bg-gray-800 rounded-xl mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 w-96 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto animate-pulse"></div>
        </div>

        {/* Search Inputs Skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-2 animate-pulse"></div>
              <div className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            </div>
            <div>
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-2 animate-pulse"></div>
              <div className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            <div className="h-12 w-40 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
          </div>
        </div>

        {/* Comparison Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Company A Skeleton */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                <div>
                  <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2 animate-pulse"></div>
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <div className="h-10 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded mt-2 animate-pulse"></div>
              </div>
            </div>

            <div className="mb-6">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>

            <div>
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2 animate-pulse"></div>
              <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Company B Skeleton */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                <div>
                  <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2 animate-pulse"></div>
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <div className="h-10 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded mt-2 animate-pulse"></div>
              </div>
            </div>

            <div className="mb-6">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>

            <div>
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2 animate-pulse"></div>
              <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Winner Verdict Skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-full mr-3 animate-pulse"></div>
              <div>
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg mb-1 animate-pulse"></div>
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mb-1 animate-pulse"></div>
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}