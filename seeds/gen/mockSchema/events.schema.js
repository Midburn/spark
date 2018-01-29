const EVENT_MOCK_SCHEMA = {
    NAME: 'event',
    PK: 'event_id',
    STRUCTURE: {
        event_id: {
            function: function() {
                const year = this.faker.date.future().getFullYear();
                return `MIDBURN${year}`
            }
        },
        name: {
            function: function() {
                const year = this.faker.date.future().getFullYear();
                return `Midbrun ${year} מידברן`
            }
        },
        gate_code: {
            faker: 'random.number'
        },
        gate_status: {
            values: ['regular']
        }
    }
};

module.exports = EVENT_MOCK_SCHEMA;
