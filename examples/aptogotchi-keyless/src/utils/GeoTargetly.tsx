"use client";

import Script from "next/script";

export const GeoTargetly = () => {
  return (
    <Script
      id="geotargetly"
      dangerouslySetInnerHTML={{
        __html: `
        (function(g,e,o,t,a,r,ge,tl,y){
            t=g.getElementsByTagName(o)[0];y=g.createElement(e);y.async=true;
            y.src='https://g9904216750.co/gb?id=-NkwFHOr-budQ-E4x08r&refurl='+g.referrer+'&winurl='+encodeURIComponent(window.location);
            t.parentNode.insertBefore(y,t);
            })(document,'script','head');
        `,
      }}
    />
  );
};
