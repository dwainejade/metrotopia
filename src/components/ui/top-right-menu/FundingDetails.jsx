
const FundingDetails = ({ funds, taxes }) => (
    <div className="bottom-categories funding">
        <div className="top-category-details">
            <p>
                <span className="category-label">Starting Funds:</span>
                <span>${funds?.starting.toLocaleString() || 0}</span>
            </p>
            <p>
                <span className="category-label">Total Spent on Development:</span>
                <span>${funds.spent.toLocaleString()}</span>
            </p>
        </div>
        <div className="bottom-checklist funding">
            <h3>Tax Income</h3>
            <div className="funding-grid-details">
                <p>
                    <span className="bottom-label">Income Tax</span>{' '}
                    <span>${taxes.income.toLocaleString()}</span>
                </p>
                <p>
                    <span className="bottom-label">Property Tax</span>{' '}
                    <span>${taxes.property.toLocaleString()}</span>
                </p>
                <p>
                    <span className="bottom-label">Sales Tax</span>{' '}
                    <span>${taxes.sales.toLocaleString()}</span>
                </p>
                <p>
                    <span className="bottom-label">Total Tax Revenue</span>{' '}
                    <span>
                        ${(taxes.sales + taxes.income + taxes.property).toLocaleString()}
                    </span>
                </p>

                <p className="funding-note">
                    Note: Tax revenue is gained immediately upon constructing a new
                    building.
                </p>
            </div>
        </div>
        <div className="bottom-funding-details">
            <span className="bottom-label">Current Funds</span>
            <span>${funds.current.toLocaleString()}</span>
        </div>
    </div>
);

export default FundingDetails;