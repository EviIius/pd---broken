import React, { useState } from 'react';

const businessAreas = {
  Federal: ['Policy A', 'Policy B', 'Policy C'],
  State: ['Policy D', 'Policy E'],
  Healthcare: ['Policy F', 'Policy G', 'Policy H', 'Policy I'],
  Finance: ['Policy J'],
  Technology: ['Policy K', 'Policy L'],
};

export default function Sidebar() {
  const [openArea, setOpenArea] = useState<string | null>(null);

  const toggleArea = (area: string) => {
    setOpenArea(openArea === area ? null : area);
  };

  return (
    <aside className="w-64 bg-gray-100 p-4">
      <h2 className="text-lg font-semibold mb-4">Policy Libraries</h2>
      <ul>
        {Object.keys(businessAreas).map((area) => (
          <li key={area} className="mb-2">
            <button
              onClick={() => toggleArea(area)}
              className="w-full text-left text-gray-700 hover:text-blue-500 focus:outline-none"
            >
              {area}
            </button>
            {openArea === area && (
              <ul className="ml-4 mt-2">
                {businessAreas[area as keyof typeof businessAreas].map((doc) => (
                  <li key={doc} className="mb-1">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      {doc}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
