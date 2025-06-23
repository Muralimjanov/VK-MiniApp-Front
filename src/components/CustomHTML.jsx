import React from'react';
import ReactToPrint from'react-to-print';

const CustomHTML = ({ html }) => {
  return (
    <ReactToPrint
      options={{
        margin: [0, 0, 0, 0],
        filename: 'https://equpment-rent-club.ru/blank-akt-priema-peredachi2.html',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { useCORS: true },
        jsx: {
          global: true,
          id: 'print-js',
          code: `
            window.print();
          `,
        },
      }}
    />
  );
};

export default CustomHTML;