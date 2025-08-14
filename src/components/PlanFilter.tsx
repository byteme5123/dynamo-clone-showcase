interface PlanFilterProps {
  activeTab: 'domestic' | 'special';
  onTabChange: (tab: 'domestic' | 'special') => void;
}

const PlanFilter = ({ activeTab, onTabChange }: PlanFilterProps) => {
  return (
    <div className="inline-flex bg-card rounded-lg p-1 shadow-sm mb-8">
      <button
        onClick={() => onTabChange('domestic')}
        className={`px-6 py-3 rounded-lg font-medium font-poppins transition-all duration-300 ${
          activeTab === 'domestic'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-foreground hover:bg-muted'
        }`}
      >
        Domestic Plans
      </button>
      <button
        onClick={() => onTabChange('special')}
        className={`px-6 py-3 rounded-lg font-medium font-poppins transition-all duration-300 ${
          activeTab === 'special'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-foreground hover:bg-muted'
        }`}
      >
        Special Plans
      </button>
    </div>
  );
};

export default PlanFilter;