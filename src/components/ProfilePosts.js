import React, { useEffect, useState } from "react"
import Axios from "axios";
import { useParams, Link } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";
import Post from "./Post";

function ProfilePosts() {
    const [isLoading,setIsLoading]=useState(true);
    const [posts,setPosts]=useState([])
    const {username}=useParams()

    useEffect(()=>{
        const ourRequest=Axios.CancelToken.source();
        async function fetchPosts()
        {
            try {
                const response= await Axios.get(`/profile/${username}/posts`,{cancelToken:ourRequest.token})
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
    },[username])

    if(isLoading)
    {
        return <LoadingDotsIcon />
    }
  return (
    <div className="list-group">
    {posts.map((e)=>{
        return <Post post={e} key={e._id} noAuthor={true} />
    })}
  </div>    
  )
}

export default ProfilePosts