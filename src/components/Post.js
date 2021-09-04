import React, { useEffect } from "react"
import {Link} from "react-router-dom"

function Post(props) {
    const e=props.post
    const date= new Date(e.createdDate)
    const dateFormatted=`${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`
    return (
      <Link onClick={props.onClick} to={`/post/${e._id}`} className="list-group-item list-group-item-action">
      <img className="avatar-tiny" src={e.author.avatar} /> <strong>{e.title}</strong>{" "}
      <span className="text-muted small">{!props.noAuthor && <>by {e.author.username}</>} on {dateFormatted} </span>
      </Link>
    )
}

export default Post