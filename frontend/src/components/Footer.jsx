import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-top py-4 mt-auto">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-2 mb-md-0">
            <span className="fw-bold text-primary fs-5">Edulytix</span>
            <span className="text-muted ms-2 small">| Smart Education System with Risk Alert &amp; Digital Library</span>
          </div>
          <div className="col-md-6 text-center text-md-end text-muted small">
            <span>&copy; {new Date().getFullYear()} Edulytix. Designed for College Academic Excellence.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
