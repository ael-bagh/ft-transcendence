import i1 from '../../imgs/1.png';
import i2 from '../../imgs/2.png';
import i3 from '../../imgs/3.png';
import i4 from '../../imgs/4.png';
import i5 from '../../imgs/5.png';

function Badges (){
    return (
        <div className='flex flex-col'>
            <h1 className='text-3xl font-sans text-center mb-4 font-extrabold'>Badges</h1>
            <div className='achievements'>
                <div className='badge'>
                    <img src={i1} alt="badge" className='badgeImg'/>
                </div>
                <div className='badge'>
                    <img src={i2} alt="badge" className='badgeImg'/>
                </div>
                <div className='badge'>
                    <img src={i3} alt="badge" className='badgeImg'/>
                </div>
                <div className='badge'>
                    <img src={i4} alt="badge" className='badgeImg'/>
                </div>
                <div className='badge'>
                    <img src={i5} alt="badge" className='badgeImg'/>
                </div>
            </div>
        </div>
    )
}

export default Badges;