import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Home, DollarSign, User, FileText, BarChart3 } from 'lucide-react';
import { getPropertyDetail } from '../services/property.service';
import './PropertyDetailPage.css';

const tabs = [
  { key: 'overview', label: 'Overview', icon: Home },
  { key: 'tax', label: 'Tax & Assessment', icon: DollarSign },
  { key: 'ownership', label: 'Ownership & Mortgage', icon: User },
  { key: 'transactions', label: 'Transactions', icon: FileText },
  { key: 'comps', label: 'Comps', icon: BarChart3 },
];

function formatPrice(val: number | null | undefined): string {
  if (!val) return 'N/A';
  return '$' + val.toLocaleString();
}

function formatDate(val: string | null | undefined): string {
  if (!val) return 'N/A';
  return new Date(val).toLocaleDateString();
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getPropertyDetail(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="detail-loading">Loading property details...</div>;
  }

  const property = data?.data?.property;
  const owner = data?.data?.owner;

  if (!property) {
    return <div className="detail-loading">Property not found</div>;
  }

  return (
    <div className="property-detail">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div className="detail-header-info">
          <h1>
            <MapPin size={20} />
            {property.address_line1}
          </h1>
          <p>{property.city}, {property.state} {property.zip} {property.county && `| ${property.county} County`}</p>
        </div>
        <div className="detail-header-value">
          <div className="est-value">{formatPrice(property.estimated_value)}</div>
          <div className="est-label">Estimated Value</div>
        </div>
      </div>

      <div className="detail-quick-stats">
        <div className="quick-stat">
          <span className="stat-num">{property.bedrooms ?? '-'}</span>
          <span className="stat-desc">Beds</span>
        </div>
        <div className="quick-stat">
          <span className="stat-num">{property.bathrooms ?? '-'}</span>
          <span className="stat-desc">Baths</span>
        </div>
        <div className="quick-stat">
          <span className="stat-num">{property.building_sqft?.toLocaleString() ?? '-'}</span>
          <span className="stat-desc">Sq Ft</span>
        </div>
        <div className="quick-stat">
          <span className="stat-num">{property.lot_size_sqft?.toLocaleString() ?? '-'}</span>
          <span className="stat-desc">Lot Sq Ft</span>
        </div>
        <div className="quick-stat">
          <span className="stat-num">{property.year_built ?? '-'}</span>
          <span className="stat-desc">Year Built</span>
        </div>
        <div className="quick-stat">
          <span className="stat-num">{property.property_type?.replace(/_/g, ' ')}</span>
          <span className="stat-desc">Type</span>
        </div>
      </div>

      <div className="detail-tabs">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`tab-btn ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="detail-content">
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="info-grid">
              <InfoCard title="Property Info">
                <InfoRow label="Address" value={`${property.address_line1}${property.address_line2 ? ', ' + property.address_line2 : ''}`} />
                <InfoRow label="City" value={property.city} />
                <InfoRow label="State" value={property.state} />
                <InfoRow label="Zip" value={property.zip} />
                <InfoRow label="County" value={property.county} />
                <InfoRow label="APN" value={property.apn} />
                <InfoRow label="FIPS" value={property.fips} />
              </InfoCard>
              <InfoCard title="Property Details">
                <InfoRow label="Property Type" value={property.property_type?.replace(/_/g, ' ')} />
                <InfoRow label="Bedrooms" value={property.bedrooms} />
                <InfoRow label="Bathrooms" value={property.bathrooms} />
                <InfoRow label="Building Sq Ft" value={property.building_sqft?.toLocaleString()} />
                <InfoRow label="Lot Size" value={property.lot_size_sqft?.toLocaleString()} />
                <InfoRow label="Year Built" value={property.year_built} />
                <InfoRow label="Condition" value={property.condition_score} />
              </InfoCard>
              <InfoCard title="Status">
                <InfoRow label="Owner Occupied" value={property.owner_occupied ? 'Yes' : 'No'} />
                <InfoRow label="Absentee Owner" value={property.absentee_owner ? 'Yes' : 'No'} />
                <InfoRow label="Corporate Owned" value={property.corporate_owned ? 'Yes' : 'No'} />
                <InfoRow label="Vacant" value={property.vacant ? 'Yes' : 'No'} />
                <InfoRow label="Foreclosure" value={property.foreclosure_status !== 'none' ? property.foreclosure_status?.replace(/_/g, ' ') : 'None'} />
                <InfoRow label="Tax Delinquent" value={property.tax_delinquent ? 'Yes' : 'No'} />
              </InfoCard>
            </div>
          </div>
        )}

        {activeTab === 'tax' && (
          <div className="tab-content">
            <div className="info-grid">
              <InfoCard title="Valuation">
                <InfoRow label="Estimated Value" value={formatPrice(property.estimated_value)} />
                <InfoRow label="Assessed Value" value={formatPrice(property.assessed_value)} />
                <InfoRow label="Last Sale Price" value={formatPrice(property.last_sale_price)} />
                <InfoRow label="Last Sale Date" value={formatDate(property.last_sale_date)} />
                <InfoRow label="Equity %" value={property.equity_percent ? `${property.equity_percent}%` : 'N/A'} />
              </InfoCard>
              <InfoCard title="Tax Information">
                <InfoRow label="Annual Tax" value={property.tax_amount ? `$${Number(property.tax_amount).toLocaleString()}` : 'N/A'} />
                <InfoRow label="Tax Year" value={property.tax_year} />
                <InfoRow label="Tax Delinquent" value={property.tax_delinquent ? 'Yes' : 'No'} />
              </InfoCard>
            </div>
          </div>
        )}

        {activeTab === 'ownership' && (
          <div className="tab-content">
            <div className="info-grid">
              <InfoCard title="Owner Information">
                {owner ? (
                  <>
                    <InfoRow label="Name" value={owner.full_name || owner.entity_name} />
                    <InfoRow label="Type" value={owner.entity_type} />
                    <InfoRow label="Mailing Address" value={owner.mailing_address} />
                    <InfoRow label="Mailing City" value={owner.mailing_city} />
                    <InfoRow label="Mailing State" value={owner.mailing_state} />
                    <InfoRow label="Mailing Zip" value={owner.mailing_zip} />
                  </>
                ) : (
                  <p className="no-data">No owner data available. Skip trace to find contact info.</p>
                )}
              </InfoCard>
              <InfoCard title="Mortgage">
                <InfoRow label="Mortgage Amount" value={formatPrice(property.mortgage_amount)} />
                <InfoRow label="Mortgage Date" value={formatDate(property.mortgage_date)} />
                <InfoRow label="Interest Rate" value={property.mortgage_rate ? `${property.mortgage_rate}%` : 'N/A'} />
                <InfoRow label="Lender" value={property.lender_name} />
                <InfoRow label="Years Owned" value={property.years_owned ? `${property.years_owned} years` : 'N/A'} />
              </InfoCard>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="tab-content">
            <InfoCard title="Transaction History">
              <div className="transaction-row">
                <div><strong>Last Sale</strong></div>
                <div>{formatDate(property.last_sale_date)}</div>
                <div>{formatPrice(property.last_sale_price)}</div>
              </div>
              <p className="no-data" style={{ marginTop: 16 }}>
                Full transaction history available with ATTOM API integration.
              </p>
            </InfoCard>
          </div>
        )}

        {activeTab === 'comps' && (
          <div className="tab-content">
            <InfoCard title="Comparable Sales">
              <p className="no-data">Comps analysis coming in Phase 5.</p>
            </InfoCard>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="info-card">
      <h3>{title}</h3>
      <div className="info-rows">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value ?? 'N/A'}</span>
    </div>
  );
}
