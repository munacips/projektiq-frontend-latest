import React from 'react'
import PropTypes from 'prop-types'; 

function SideBarItem({item, label,url}) {
    return (
        <li style={itemStyle} onClick = {()=>{
                console.log(url)
                window.location.href=url
            }}>
            {item}<br /> 
            <span style={spanStyle}>{label}</span>
            <br />
        </li>
    )
}

const spanStyle = {
    fontSize: '0.7em',
}


SideBarItem.propTypes = {
    item: PropTypes.element.isRequired,
    label: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
}

const itemStyle = {
    cursor : 'pointer'
}

export default SideBarItem
