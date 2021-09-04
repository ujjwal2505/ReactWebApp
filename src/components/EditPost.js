import React, { useContext, useEffect, useState } from "react"
import { useImmerReducer } from "use-immer";
import { useParams,Link,withRouter } from "react-router-dom";
import Page from "./Page"
import Axios from "axios"
import LoadingDotsIcon from "./LoadingDotsIcon";
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext";
import NotFound from "./NotFound";


function EditPost(props) {

  const appState=useContext(StateContext)
  const appDispatch=useContext(DispatchContext)

  const initialState={
    title:{
      value:"",
      hasErrors:false,
      message:""
    },
    body:{
      value:"",
      hasErrors:false,
      message:""
    },
    isFetching:true,
    isSaving:false,
    id:useParams().id,
    saveText:"Save Updates",
    sendCount:0,
    notFound:false
  }

  function ourReducer(draft,action)
  {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value=action.value.title
        draft.body.value=action.value.body
        draft.isFetching=false
        return 
      case "titleChange":
          draft.title.hasErrors=false
          draft.title.value=action.value
        return
      case "bodyChange":
        draft.body.hasErrors=false
        draft.body.value=action.value
        return
      case "submitRequest":
        if(!draft.title.hasErrors && !draft.body.hasErrors)
        {
          draft.sendCount++
        }
        return
      case "saveRequestStarted":
        draft.isSaving=true
        draft.saveText=action.value
        return
      case "saveRequestFinshed":
        draft.isSaving=false
        draft.saveText=action.value
        return
      case "titleRules":
        if(!action.value.trim())
        {
          draft.title.hasErrors=true
          draft.title.message="You must provide a title"
        }
        return
      case "bodyRules":
        if(!action.value.trim())
        {
          draft.body.hasErrors=true
          draft.body.message="You must provide a body"
        }
        return
      case "notFound":
        draft.notFound=true
        return
    }
    
  }
  
  const [state,dispatch]=useImmerReducer(ourReducer,initialState)

  function handleSubmit(e)
  {
    dispatch({type:"titleRules",value:state.title.value})
    dispatch({type:"bodyRules",value:state.body.value})
    e.preventDefault()
    dispatch({type:"submitRequest"})
  }


  useEffect(()=>{
    const ourRequest=Axios.CancelToken.source()
    async function fetchUserPost()
    {
      try {
        const response=await Axios.get(`/post/${state.id}`,{cancelToken:ourRequest.token})
        if(response.data)
        {
          dispatch({type:"fetchComplete",value:response.data})
          console.log(response.data)
          if(appState.user.username!=response.data.author.username)
          {
            appDispatch({type:"flashMessage", value:"You do not have permission to edit this post"})
            //redirect to homepage
            props.history.push("/")
          }
        }
        else{
          dispatch({type:"notFound"})
        }
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
  },[])

  useEffect(()=>{
    if(state.sendCount)
    {
      dispatch({type:"saveRequestStarted",value:"Saving..."})
      const ourRequest=Axios.CancelToken.source()
      async function fetchUserPost()
      {
        try {
          const response=await Axios.post(`/post/${state.id}/edit`,{title:state.title.value, body:state.body.value, token:appState.user.token},{cancelToken:ourRequest.token})
          dispatch({type:"saveRequestFinshed",value:"Save Updates"})
          appDispatch({type:"flashMessage",value:"Post has been updated"})
          console.log(response.data)
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
    }
  },[state.sendCount])

  if(state.notFound)
  {
    return(
      <NotFound />
    )
  }
  
  if(state.isFetching)
  {
    return <Page title="...."><LoadingDotsIcon /></Page>
  }

  return (
    <Page title="Edit Post">
      <Link to={`/post/${state.id}`} className="small font-weight-bold">&laquo; Back to post permalink</Link>
    <form className="mt-3" onSubmit={handleSubmit}>
        <div className="form-group">
            <label htmlFor="post-title" className="text-muted mb-1">
                <small>Title</small>
            </label>
            <input onBlur={(e)=> dispatch({type:"titleRules",value:e.target.value})} onChange={(e)=>dispatch({type:"titleChange",value:e.target.value})} value={state.title.value} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
            {state.title.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.title.message}</div>}
        </div>

        <div className="form-group">
            <label htmlFor="post-body" className="text-muted mb-1 d-block">
                <small>Body Content</small>
            </label>
            <textarea onBlur={(e)=>dispatch({type:"bodyRules",value:e.target.value})} onChange={(e)=>dispatch({type:"bodyChange",value:e.target.value})} name="body" id="post-body" className="body-content tall-textarea form-control" type="text" value={state.body.value} />
            {state.body.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.body.message}</div>}
        </div>
        <button className="btn btn-primary" disabled={state.isSaving}>{state.saveText}</button>
  </form>
  </Page>
  )
}

export default withRouter(EditPost)