import React from 'react';
import {Link} from 'react-router-dom';
import UPortAuth from './UPortAuth';

const Header = () => {
    return (
        <div className="ui secondary pointing menu">
            <Link to="/" className="item">
                Pegasus Investments
            </Link>
            <div className="right menu">
                <Link to="/" className="item">
                    All Investments
                </Link>
                <UPortAuth />
            </div>
        </div>
    );
};

export default Header;