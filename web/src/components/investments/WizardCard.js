import React from 'react';
import { Card, Image } from 'semantic-ui-react';

export default ({ header, description, meta }) => {
  return (
    <Card>
      <Image src='' wrapped ui={false} />
      <Card.Content>
        <Card.Header>{header}</Card.Header>
        <Card.Meta>
          <span className='date'>{meta}</span>
        </Card.Meta>
        <Card.Description>
          {description}
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        some extra content
      </Card.Content>
    </Card>
  );
};