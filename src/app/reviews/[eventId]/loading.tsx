import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <div className="w-16 h-5 bg-gray-200 rounded mr-4"></div>
            <div className="w-32 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Information Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-8">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6 space-y-4">
                <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                      <div className="w-32 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Review Section Skeleton */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Review Statistics */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="w-40 h-6 bg-gray-200 rounded mb-4"></div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-8 bg-gray-200 rounded mx-auto"></div>
                    <div className="flex justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 bg-gray-200 rounded"
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-8 h-4 bg-gray-200 rounded"></div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2"></div>
                        <div className="w-8 h-4 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Form */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="w-32 h-6 bg-gray-200 rounded mb-6"></div>

                {/* Star Rating */}
                <div className="space-y-3 mb-6">
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 bg-gray-200 rounded"
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Comment Box */}
                <div className="space-y-3 mb-6">
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  <div className="w-full h-32 bg-gray-200 rounded"></div>
                </div>

                {/* Submit Button */}
                <div className="w-full h-12 bg-blue-200 rounded"></div>
              </div>

              {/* Reviews List */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="w-28 h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-4 bg-gray-200 rounded"></div>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, j) => (
                                <div
                                  key={j}
                                  className="w-4 h-4 bg-gray-200 rounded"
                                ></div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="w-full h-4 bg-gray-200 rounded"></div>
                            <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
