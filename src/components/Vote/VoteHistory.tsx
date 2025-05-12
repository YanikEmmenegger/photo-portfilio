import {useUser} from "../../contexts/UserContext.tsx";
import {Vote} from "../../types/types.ts";
import HistoryItem from "./HistoryItem.tsx";

const VoteHistory = () => {

    const {votes} = useUser()
    return (
        <div className='w-full text-center py-20'>
            <h1 className={"text-xl md:text-3xl pb-20"}>
                Your Vote History:
            </h1>
            <div className={"flex-col-reverse flex justify-center items-center"}>
            {
                votes.map((vote: Vote) => <HistoryItem vote={vote} key={vote.vote_id}/>)
            }
            </div>
        </div>
    )
}
export default VoteHistory;
