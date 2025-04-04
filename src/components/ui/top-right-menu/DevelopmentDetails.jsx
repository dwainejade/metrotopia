import AnimatedValue from '../../../helpers/AnimatedValue';

const DevelopmentDetails = ({ urbanization, satisfaction }) => {
  // Calculate percentages based on urbanized parcels
  const urbanizedParcels = urbanization.parcels.urbanized;
  const calculatePercentage = (count) => {
    return urbanizedParcels > 0
      ? ((count / urbanizedParcels) * 100).toFixed()
      : '0.0';
  };
  const { residential, commercial, industrial, services } =
    urbanization.parcels;

  return (
    <div className="bottom-categories urbanization">
      <div className="top-category-details">
        <p>
          <span className="category-label">Development Satisfaction: </span>
          <AnimatedValue value={satisfaction.score} precision={0} />%
        </p>
        <p>
          <span className="category-label">
            Percentage of Parcels Developed:
          </span>{' '}
          <span>{urbanization.parcels.urbanized}%</span>
        </p>
      </div>
      <div className="bottom-checklist urbanization">
        {/* <h3>Developed Parcels</h3> */}
        <div className="details-grid">
          <div>
            <span className="bottom-label">
              Residential:{' '}
              <span className="urban-percent">
                {calculatePercentage(residential)}%
              </span>
            </span>{' '}
            <p className="add-details">
              Single-Family: {urbanization.buildings.singleFamilyHomes}
            </p>
            <p className="add-details">
              Apartments: {urbanization.buildings.apartmentComplex}
            </p>
          </div>
          <div>
            <span className="bottom-label">
              Industrial:{' '}
              <span className="urban-percent">
                {calculatePercentage(industrial)}%
              </span>
            </span>{' '}
            <p className="add-details">
              Warehouses: {urbanization.buildings.warehouse}
            </p>
            <p className="add-details">
              Factories: {urbanization.buildings.factory}
            </p>
          </div>
          <div>
            <span className="bottom-label">
              Commercial:{' '}
              <span className="urban-percent">
                {calculatePercentage(commercial)}%
              </span>
            </span>{' '}
            <p className="add-details">
              Retail Centers: {urbanization.buildings.retailCenter}
            </p>
            <p className="add-details">
              Hotels: {urbanization.buildings.hotels}
            </p>
            <p className="add-details">
              Medium Office: {urbanization.buildings.mediumOfficeBuildings}
            </p>
            <p className="add-details">
              Tall Office: {urbanization.buildings.tallOfficeBuilding}
            </p>
          </div>
          <div>
            <span className="bottom-label">
              Services:{' '}
              <span className="urban-percent">
                {calculatePercentage(services)}%
              </span>
            </span>{' '}
            <p className="add-details">
              Hospitals: {urbanization.buildings.hospital}
            </p>
            <p className="add-details">
              Government: {urbanization.buildings.governmentBuilding}
            </p>
          </div>
        </div>
      </div>
      <p className="bottom-urbanization-note">
        Click the graph button above for more information about your development
        satisfaction rating.
      </p>
    </div>
  );
};

export default DevelopmentDetails;
