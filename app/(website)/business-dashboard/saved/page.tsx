import UserSavedData from '@/components/customer-dashboard/saved/saved-data'
import React from 'react'

export default function page() {
    return (
        <main className=''>
            <div className="container">
                <div className="pb-7">
                    <h2 className='text-2xl font-semibold'>Saved</h2>
                    <p>Here, you can see the shops you have saved in your collections</p>
                </div>
                <UserSavedData />
            </div>
        </main>
    )
}
