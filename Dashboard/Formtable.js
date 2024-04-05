import React from "react";
import "../styles/App.css";
import { MdClose } from "react-icons/md";

const Formtable = ({handleSubmit, handleOnChange, handleClose, rest}) => {
    return (
        <div className="addContainer">
            <form onSubmit={handleSubmit}>
                <div className='close-btn' onClick={handleClose}><MdClose /></div>
                <label htmlFor="type">Type : </label>
                <input type="text" id="type" name="type" onChange={handleOnChange} value={rest.type}/>

                <label htmlFor="name">Name : </label>
                <input type="text" id="name" name="name" onChange={handleOnChange} value={rest.name}/>

                <label htmlFor="value">Value : </label>
                <input type="text" id="value" name="value" onChange={handleOnChange} value={rest.value}/>

                <label htmlFor="ttl">TTL : </label>
                <input type="number" id="ttl" name="ttl" onChange={handleOnChange} value={rest.ttl}/>

                <button className="btn">Submit</button>
            </form>
        </div>
    )
}
export default Formtable
