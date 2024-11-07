import styled from 'styled-components';
import createRex from './createRex';

const Highlight = styled.span`
  color: red;
`;

const highlightedText = (text, query) => {
  if (
    query !== '' &&
    text
      .toLowerCase()
      .split(' ')
      .join('')
      .includes(query.toLowerCase().split(' ').join(''))
  ) {
    const rexQuery = createRex(query);
    const rex = new RegExp(rexQuery);
    const highlighted = text.match(rex);
    const nonHighlighted = text.replace(text.match(rex), '');

    return (
      <>
        {highlighted.index === 0 ? (
          <>
            <Highlight>{highlighted[0]}</Highlight>
            {nonHighlighted}
          </>
        ) : (
          <>
            {nonHighlighted}
            <Highlight>{highlighted[0]}</Highlight>
          </>
        )}
      </>
    );
  }

  return text;
};

export default highlightedText;
