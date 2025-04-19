import React from 'react'
import PartnerSideBar from '../../components/PartnerSideBar'

const PartnerEvents = () => {
  return (
    <div className="min-h-screen bg-[#fdfcdcff]">
      <PartnerSideBar />
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-[#001524ff] mb-8">
            Manage <span className="text-[#fea116ff]">Events</span>
          </h1>
          {/* Add your events content here */}
        </div>
      </main>
    </div>
  )
}

export default PartnerEvents