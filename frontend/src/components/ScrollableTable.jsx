import React, { Children, cloneElement, useLayoutEffect, useRef } from 'react';

export default function ScrollableTable({ className, columns, children }) {
  const headerRef = useRef(null);
  const headerTableRef = useRef(null);
  const bodyTableRef = useRef(null);
  const scrollRef = useRef(null);
  const [head, body] = Children.toArray(children);
  const columnGroup = (
    <colgroup>
      {columns.map((width, index) => (
        <col key={index} style={{ width: `${width}%` }} />
      ))}
    </colgroup>
  );

  useLayoutEffect(() => {
    const alignHeader = () => {
      headerTableRef.current.style.width = `${bodyTableRef.current.getBoundingClientRect().width}px`;
      headerRef.current.style.width = `${scrollRef.current.clientWidth}px`;
      headerRef.current.style.marginLeft = `${scrollRef.current.clientLeft}px`;
      headerRef.current.scrollLeft = scrollRef.current.scrollLeft;
    };
    alignHeader();
    const observer = new ResizeObserver(alignHeader);
    observer.observe(bodyTableRef.current);
    observer.observe(scrollRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="table-heading-surface" aria-hidden="true">
        <div className="table-fixed-heading" ref={headerRef}>
          <table className={className} ref={headerTableRef}>
            {columnGroup}
            {head}
          </table>
        </div>
      </div>
      <div
        className="table-responsive table-body-scroll"
        ref={scrollRef}
        tabIndex={0}
        aria-label={body.props['aria-label']}
        onScroll={(event) => {
          headerRef.current.scrollLeft = event.currentTarget.scrollLeft;
        }}
      >
        <table className={className} ref={bodyTableRef}>
          {columnGroup}
          {cloneElement(head, { className: 'visually-hidden' })}
          {cloneElement(body, { tabIndex: undefined })}
        </table>
      </div>
    </>
  );
}
