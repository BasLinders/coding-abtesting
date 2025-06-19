// performance measure for a/b tests

performance.mark('start-607');
performance.mark('end-607');
performance.measure('Measure607', 'start-607', 'end-607');
console.log(performance.getEntriesByName('Measure607'));
