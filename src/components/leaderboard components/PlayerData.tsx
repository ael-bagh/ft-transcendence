export default function PlayerData (){
    return (
            <div className="flex flex-col md:w-3/6 justify-center items-center gap-3">
                <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{width: '75%'}}>Winrate 75%</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{width: '80%'}}>0.80 KDA(GOALS GIVEN/RECEIVED)</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{width: '25%'}}>level 50/200</div>
                </div>
            </div>
    )
}