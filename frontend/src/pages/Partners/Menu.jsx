import React from 'react'
import PartnerSideBar from '../../components/PartnerSideBar'
const Menu = () => {
  return (
    <div>
      <PartnerSideBar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">
          Menu Management
        </h1>
      </div>
    </div>
  )
}

export default Menu