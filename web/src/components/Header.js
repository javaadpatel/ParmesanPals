import React from 'react';
import { Icon } from 'semantic-ui-react';

const Header = () => {
  return (
    <div className="ui secondary pointing menu light-border">
      <h1 className="item site-header"> 
        Parmesan Pals 
        <Icon name='wizard' size='big' /> 
      </h1>
    </div>
  );
};

export default Header;