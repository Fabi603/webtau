package com.twosigma.webtau.expectation.equality.handlers;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.twosigma.webtau.data.converters.ToMapConverters;
import com.twosigma.webtau.data.table.Header;
import com.twosigma.webtau.data.table.TableData;
import com.twosigma.webtau.data.table.comparison.TableDataComparison;
import com.twosigma.webtau.data.table.comparison.TableDataComparisonReport;
import com.twosigma.webtau.data.table.comparison.TableDataComparisonResult;
import com.twosigma.webtau.expectation.ActualPath;
import com.twosigma.webtau.expectation.equality.EqualComparator;
import com.twosigma.webtau.expectation.equality.EqualComparatorHandler;

public class IterableAndTableDataEqualHandler implements EqualComparatorHandler {
    @Override
    public boolean handle(Object actual, Object expected) {
        return actual instanceof Iterable && expected instanceof TableData;
    }

    @Override
    public void compare(EqualComparator equalComparator, ActualPath actualPath, Object actual, Object expected) {
        TableData expectedTable = (TableData) expected;
        TableData actualTable = createTableFromList(expectedTable.getHeader(), (List) actual);

        TableDataComparisonResult result = TableDataComparison.compare(actualTable, expectedTable);
        if (! result.areEqual()) {
            equalComparator.reportMismatch(this, actualPath, new TableDataComparisonReport(result).generate());
        }
    }

    private static TableData createTableFromList(Header expectedHeader, List actualList) {
        TableData actualTable = new TableData(expectedHeader.getNames());
        for (Object actualRecord : actualList) {
            Map<String, ?> actualMap = ToMapConverters.convert(actualRecord);
            actualTable.addRow(mapToList(expectedHeader, actualMap));
        }

        return actualTable;
    }

    private static List<Object> mapToList(Header header, Map<String, ?> map) {
        List<Object> result = new ArrayList<>();
        header.getNames().forEach(n -> result.add(map.get(n)));

        return result;
    }
}
