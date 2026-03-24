import {format} from "date-fns"
import {Link} from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function Post({_id,title,summary,cover,content,createdAt,author}){
    return(
        <div className="post">
        <div className="image">
        <Link to={`/post/${_id}`}>
          <img src={`${API_BASE_URL}/${cover}`} alt=""/>
        </Link>
      </div>
        <div className="texts">
          <h2>{title}</h2>
          <p className="info">
          <a className="author">{author?.username || 'Unknown Author'}</a>
            <time>{format(new Date(createdAt),'MMM d, yyyy HH:mm')}</time>
          </p>
          <p className="summary">{summary}</p>
        </div>
      </div>
    )
}