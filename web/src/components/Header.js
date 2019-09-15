import React from 'react';
import { Icon, Image } from 'semantic-ui-react';
import wizardLogo from '../assets/wizard.gif';

const Header = () => {
  return (
    <div className="ui secondary pointing menu light-border">
      <h1 className="item site-header"> 
        <Image src={wizardLogo} size='tiny' />
        Parmesan Pals 
      </h1>
    </div>
  );
};

export default Header;