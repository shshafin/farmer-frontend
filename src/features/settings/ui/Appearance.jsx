function Appearance(){
    return (<>
        <section className="flex FY-center F-space">
            <div className="icon">
                ii
            </div>

            <section className="details">
                <div className="name">থিম</div>
                <div className="gray">{mode === 'dark' ? 'ডার্ক' : 'লাইট'} মোড সক্রিয়</div>
            </section>

            <button className="changeMode">ডার্ক/লাইট মোডে পরিবর্তন করুন</button>
        </section>
        </>)
}