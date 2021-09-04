import React, { useContext, useEffect, useState } from "react"
import { useParams,Link,withRouter } from "react-router-dom";
import Page from "./Page"
import Axios from "axios"
import LoadingDotsIcon from "./LoadingDotsIcon";
import ReactMarkdown from "react-markdown";
import ReactTooltip from "react-tooltip";
import NotFound from "./NotFound";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

function ViewSinglePost(props) {

  const [isLoading,setIsLoading]=useState(true);
  const [post,setPost]=useState();
  const {id}=useParams();
  const appState=useContext(StateContext)
  const appDispatch=useContext(DispatchContext)

  useEffect(()=>{
    const ourRequest=Axios.CancelToken.source()
    async function fetchUserPost()
    {
      try {
        const response=await Axios.get(`/post/${id}`,{cancelToken:ourRequest.token})
        setPost(response.data);
        console.log(response.data)
        setIsLoading(false);
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
    fetchUserPost();
    return ()=>{
      ourRequest.cancel();
    }
  },[id])

  if(!isLoading && !post)
  {
    return <NotFound />
  }

  if(isLoading)
  {
    return <Page title="...."><LoadingDotsIcon /></Page>
  }

  const date=new Date(post.createdDate)
  const dateFormatted=`${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`
  
  function isOwner()
  {
    if(appState.loggedIn)
    {
      return appState.user.username==post.author.username
    }
    else{
      return false
    }
  }

  async function handleDelete()
  {
    const areYouSure=window.confirm("Do you want to delete this post")
    if(areYouSure)
    {
      try {
        const response=await Axios.delete(`/post/${id}`,{data:{token:appState.user.token}})
        if(response.data=="Success")
        {
          appDispatch({type:"flashMessage",value:"Post has been successfully deleted"})
          props.history.push(`/profile/${appState.user.username}`)
        }
        
      } catch (error) {
        console.log("Cannot delete the post")
      }
    }
  }

  return (
    <Page title={post.title}>
     <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
           <span className="pt-2">
           <Link to={`/post/${id}/edit`} data-tip="Edit" data-for="edit" className="text-primary mr-2"><i className="fas fa-edit"></i></Link>
           <ReactTooltip id="edit" className="custom-tooltip" />{" "}
           <a onClick={handleDelete} data-tip="Delete" data-for="delete" className="delete-post-button text-danger"><i className="fas fa-trash"></i></a>
           <ReactTooltip id="delete" className="custom-tooltip" />
         </span>
        )}
       
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {dateFormatted}
      </p>

      <div className="body-content">
        <ReactMarkdown children={post.body} />
      </div>

    </Page>
  )
}

export default withRouter(ViewSinglePost)