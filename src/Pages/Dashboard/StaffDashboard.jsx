import React from 'react'
import { PageTitle } from '../../Atoms'
import { Tab } from '../../components'

const StaffDashboard = () => {
    const tabs = [
        { label: "Add Staff", content:'Add Staff' },
        { label: "View Menu", content: 'View Staff' },
      ];
  return (
    <>
    <div style={{marginTop:'70px'}}>
    <PageTitle pageTitle={'Staff Managment'}/>
    <Tab tabs={tabs}/>
    </div>
    </>
  )
}

export default StaffDashboard