import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';

const Header = () => {
  return (
    <div className="ui secondary pointing menu">
      <Link style={{ fontSize: '26px' }} to="/" className="item"> 
        Parmesan Pals 
        <Icon name='wizard' size='big' /> 
      </Link>
    </div>
  );
};

export default Header;