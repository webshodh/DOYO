//  {/* Orders Section */}
//  <div className="background-card">
//  <PageTitle pageTitle="Orders" />
//  <div className="d-flex flex-wrap">
//    <div className="col-12 col-md-6 col-lg-3 mb-3">
//      <CountCard
//        icon="bi-exclamation-circle-fill"
//        iconColor="red"
//        count={orderCounts.pending}
//        label="Pending Orders"
//        type="primary"
//      />
//    </div>
//    <div className="col-12 col-md-6 col-lg-3 mb-3">
//      <CountCard
//        icon="bi-check-circle"
//        iconColor="orange"
//        count={orderCounts.accepted}
//        label="Accepted Orders"
//        type="primary"
//      />
//    </div>
//    <div className="col-12 col-md-6 col-lg-3 mb-3">
//      <CountCard
//        icon="bi-check-circle-fill"
//        iconColor="#00C000"
//        count={orderCounts.completed}
//        label="Completed Orders"
//        type="primary"
//      />
//    </div>
//    <div className="col-12 col-md-6 col-lg-3 mb-3">
//      <CountCard
//        icon="bi-x-circle-fill"
//        iconColor="red"
//        count={orderCounts.cancelled}
//        label="Cancelled Orders"
//        type="primary"
//      />
//    </div>
//  </div>
// </div>
// <div className="row gx-0">
//  <div className="col-lg-9 col-md-8 col-sm-12">
//    {/* Customer Section */}
//    <div className="row mt-4">
//      <div className="col-12">
//        <div className="background-card">
//          <PageTitle pageTitle="Customers" />
//          <div className="row">
//            <div className="col-12 col-md-6 col-lg-4 mb-3">
//              <CountCard
//                icon="bi-person-fill-add"
//                iconColor=""
//                count={customerContData.totalCustomers}
//                label="Total Customers"
//                type="primary"
//              />
//            </div>
//            <div className="col-12 col-md-6 col-lg-4 mb-3">
//              <CountCard
//                icon="bi-person-fill-up"
//                iconColor="#00C000"
//                count={customerContData.newCustomers}
//                label="New Customers"
//                type="primary"
//              />
//            </div>
//            <div className="col-12 col-md-6 col-lg-4 mb-3">
//              <CountCard
//                icon="bi-person-heart"
//                iconColor="red"
//                count={customerContData.loyalCustomers}
//                label="Loyal Customers"
//                type="primary"
//              />
//            </div>
//          </div>
//        </div>
//      </div>
//    </div>

//    {/* Revenue Section */}
//    <div className="row mt-4">
//      <div className="col-12">
//        <div className="background-card">
//          <PageTitle pageTitle="Revenue" />
//          <div className="row">
//            <div className="col-12 col-md-6 col-lg-4 mb-3">
//              <CountCard
//                icon="bi-currency-rupee"
//                iconColor="#00C000"
//                count={totalRevenue}
//                label="Total Revenue"
//                type="primary"
//              />
//            </div>
//            <div className="col-12 col-md-6 col-lg-4 mb-3">
//              <CountCard
//                icon="fa-list"
//                count={0}
//                label="Avg Revenue/Day"
//                type="primary"
//              />
//            </div>
//            <div className="col-12 col-md-6 col-lg-4 mb-3">
//              <CountCard
//                icon="fa-list"
//                count={0}
//                label="Avg Revenue/Day"
//                type="primary"
//              />
//            </div>
//          </div>
//        </div>
//      </div>
//    </div>
//  </div>

//  <div className="col-lg-3 col-md-12 col-sm-12">
//    {/* Menu and Category Section */}
//    <div className="row mt-4">
//      <div className="col-12">
//        <div className="background-card">
//          <PageTitle pageTitle="Menu" />
//          <div className="row">
//            <div className="col-12 col-md-6 col-lg-12 mb-3">
//              <CountCard
//                src="/serving.png"
//                iconColor="orange"
//                count={totalMenus}
//                label="Total Menus"
//                type="primary"
//              />
//            </div>
//            <div className="col-12 col-md-6 col-lg-12 mb-3">
//              <CountCard
//                src="/tag.png"
//                iconColor="red"
//                count={totalCategories}
//                label="Total Categories"
//                type="primary"
//              />
//            </div>
//          </div>
//        </div>
//      </div>
//    </div>
//  </div>
// </div>




 {/* Orders by Category Section */}
//  <div className="row mt-4 d-flex flex-wrap">
//  <div className="col-12 background-card">
//    <PageTitle pageTitle="Orders by Category" />
//    <div className="category-items d-flex flex-wrap mb-3">
//      {categoryDataArray
//        .slice(0, showAll ? categoryDataArray.length : 4)
//        .map(({ menuCategory, menuCategoryCount }, index) => (
//          <div
//            key={index}
//            className="category-item d-flex align-items-center mx-2 mb-3 capsule"
//          >
//            <div className="category-content d-flex align-items-center">
//              <span className="category-name mx-2">
//                {menuCategory}
//              </span>
//              <span className="category-badge-number">
//                {menuCategoryCount}
//              </span>
//            </div>
//          </div>
//        ))}
//    </div>
//    {menuDataArray.length > 6 && (
//      <div className="show-more-card text-center">
//        <p onClick={() => setShowAll(!showAll)} className="show-more">
//          {showAll ? "Show Less" : "Show More"}
//        </p>
//      </div>
//    )}
//  </div>
// </div>