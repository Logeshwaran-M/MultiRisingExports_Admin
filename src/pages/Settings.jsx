const Settings = () => {
  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-9">

          <div className="card shadow border-0 rounded-4 p-4">

            <h4 className="fw-bold text-primary mb-4">
              ⚙ Store Settings
            </h4>

            <form>

              {/* Store Info */}
              <h6 className="text-secondary fw-semibold mb-3">
                Store Information
              </h6>

              <div className="row mb-3 align-items-center">
                <label className="col-sm-3 col-form-label fw-medium">
                  Store Name
                </label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Multi Rising Store"
                  />
                </div>
              </div>

              <div className="row mb-3 align-items-center">
                <label className="col-sm-3 col-form-label fw-medium">
                  Support Email
                </label>
                <div className="col-sm-9">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="support@email.com"
                  />
                </div>
              </div>

              <div className="row mb-4 align-items-center">
                <label className="col-sm-3 col-form-label fw-medium">
                  Contact Number
                </label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <hr className="my-4" />

              {/* Shipping Settings */}
              <h6 className="text-secondary fw-semibold mb-3">
                Shipping Settings
              </h6>

              <div className="row mb-3 align-items-center">
                <label className="col-sm-3 col-form-label fw-medium">
                  Domestic Fee (₹)
                </label>
                <div className="col-sm-9">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="row mb-4 align-items-center">
                <label className="col-sm-3 col-form-label fw-medium">
                  International Fee (₹)
                </label>
                <div className="col-sm-9">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="1500"
                  />
                </div>
              </div>

              <div className="text-end">
                <button className="btn btn-primary px-4 rounded-pill">
                  Save Changes
                </button>
              </div>

            </form>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;