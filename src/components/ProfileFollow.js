import React, { useEffect, useState } from "react"
import Axios from "axios";
import { useParams, Link } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";

function ProfileFollow(props) {
    const [isLoading,setIsLoading]=useState(true);
    const [posts,setPosts]=useState([])
    const {username}=useParams()

    useEffect(()=>{
        const ourRequest=Axios.CancelToken.source();
        async function fetchPosts()
        {
            try {
                const response= await Axios.get(`/profile/${username}/${props.action}`,{cancelToken:ourRequest.token})
                console.log(response)
                setPosts(response.data)
                setIsLoading(false)
            } catch (error) {
            if(Axios.isCancel(error))
                {
                    console.log("cancel request of axios")
                }
                else{
                    console.log("Their was an error");
                }
            }
        }            
        fetchPosts()
        return ()=>{
            ourRequest.cancel();
        }
    },[props.action])

    if(isLoading)
    {
        return <LoadingDotsIcon />
    }
  return (
    <div className="list-group">
    {posts.map((follower,index)=>{
        return (
            <Link key={index} to={`/profile/${follower.username}`} className="list-group-item list-group-item-action">
            <img className="avatar-tiny" src={follower.avatar} />{follower.username}
            </Link>
        )
    })}
  </div>    
  )
}

export default ProfileFollow