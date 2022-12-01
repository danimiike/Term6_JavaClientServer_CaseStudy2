package com.info5059.casestudy.report;

import com.info5059.casestudy.purchase.PurchaseOrder;
import com.info5059.casestudy.purchase.PurchaseOrderDAO;
import com.info5059.casestudy.purchase.PurchaseOrderLineitem;
import com.info5059.casestudy.purchase.PurchaseOrderRepository;
import com.info5059.casestudy.product.Product;
import com.info5059.casestudy.product.ProductRepository;
import com.info5059.casestudy.product.QRCodeGenerator;
import com.info5059.casestudy.vendor.Vendor;
import com.info5059.casestudy.vendor.VendorRepository;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;

import org.springframework.web.servlet.view.document.AbstractPdfView;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.net.URL;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

public abstract class ReportPDFGenerator extends AbstractPdfView {
        private static final DateTimeFormatter format = DateTimeFormatter.ofPattern("MM/dd/yy, hh:mm a");
        private static BigDecimal ext;
        private static BigDecimal normalprice;
        private static BigDecimal sub;
        private static BigDecimal tax;
        private static BigDecimal tot;
        private static Locale locale = new Locale("en", "US");
        private static NumberFormat formatter = NumberFormat.getCurrencyInstance(locale);

        public static ByteArrayInputStream generateReport(String poid,
                        PurchaseOrderRepository purchaseRepository,
                        VendorRepository vendorRepository, ProductRepository productRepository) throws IOException {
                URL imageUrl = ReportPDFGenerator.class.getResource("/static/assets/images/logo.png");
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                PdfWriter writer = new PdfWriter(baos);
                PdfDocument pdf = new PdfDocument(writer);
                Document document = new Document(pdf);
                PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);
                Image img = new Image(ImageDataFactory.create(imageUrl)).scaleAbsolute(120,
                                120)
                                .setFixedPosition(80, 710);
                document.add(img);

                try {
                        document.add(new Paragraph("\n\n\n"));
                        Optional<PurchaseOrder> optpo = purchaseRepository.findById(Long.parseLong(poid));

                        PurchaseOrder poReport = optpo.get();

                        document.add(new Paragraph(String.format("Purchase Order")).setFont(font)
                                        .setFontSize(16)
                                        .setMarginRight(45).setTextAlignment(TextAlignment.RIGHT));
                        document.add(new Paragraph(String.format("#:" +
                                        poid)).setFont(font)
                                        .setFontSize(16)
                                        .setMarginRight(45).setTextAlignment(TextAlignment.RIGHT));
                        document.add(new Paragraph("\n\n"));
                        Optional<Vendor> optVendor = vendorRepository.findById(poReport.getVendorid());

                        ext = new BigDecimal(0.0);
                        normalprice = new BigDecimal(0.0);
                        sub = new BigDecimal(0.0);
                        tax = new BigDecimal(0.0);
                        tot = new BigDecimal(0.0);

                        if (optVendor.isPresent()) {
                                Vendor vendor = optVendor.get();
                                Table table = new Table(3);
                                table.setWidth(new UnitValue(UnitValue.PERCENT, 45));
                                Cell cell = new Cell(5, 2)
                                                .add(new Paragraph("Vendor:").setFont(font).setFontSize(12).setBold())
                                                .setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.CENTER)
                                                .setBackgroundColor(ColorConstants.WHITE);
                                table.addCell(cell);
                                cell = new Cell()
                                                .add(new Paragraph(vendor.getName()).setFont(font).setFontSize(12)
                                                                .setBold())
                                                .setTextAlignment(TextAlignment.LEFT).setBorder(Border.NO_BORDER)
                                                .setBackgroundColor(ColorConstants.LIGHT_GRAY);
                                table.addCell(cell);
                                cell = new Cell()
                                                .add(new Paragraph(vendor.getAddress1()).setFont(font).setFontSize(12)
                                                                .setBold())
                                                .setTextAlignment(TextAlignment.LEFT).setBorder(Border.NO_BORDER)
                                                .setBackgroundColor(ColorConstants.LIGHT_GRAY);
                                table.addCell(cell);
                                cell = new Cell()
                                                .add(new Paragraph(vendor.getCity()).setFont(font).setFontSize(12)
                                                                .setBold())
                                                .setTextAlignment(TextAlignment.LEFT).setBorder(Border.NO_BORDER)
                                                .setBackgroundColor(ColorConstants.LIGHT_GRAY);
                                table.addCell(cell);
                                cell = new Cell()
                                                .add(new Paragraph(vendor.getProvince()).setFont(font).setFontSize(12)
                                                                .setBold())
                                                .setTextAlignment(TextAlignment.LEFT).setBorder(Border.NO_BORDER)
                                                .setBackgroundColor(ColorConstants.LIGHT_GRAY);
                                table.addCell(cell);
                                cell = new Cell()
                                                .add(new Paragraph(vendor.getEmail()).setFont(font).setFontSize(12)
                                                                .setBold())
                                                .setTextAlignment(TextAlignment.LEFT).setBorder(Border.NO_BORDER)
                                                .setBackgroundColor(ColorConstants.LIGHT_GRAY);
                                table.addCell(cell);
                                document.add(table);

                                document.add(new Paragraph("\n\n"));

                                Table productOrderTable = new Table(5);
                                productOrderTable.setWidth(new UnitValue(UnitValue.PERCENT, 100));

                                cell = new Cell().add(
                                                new Paragraph("Product Code").setFont(font).setFontSize(12).setBold())
                                                .setTextAlignment(TextAlignment.CENTER);
                                productOrderTable.addCell(cell);
                                cell = new Cell().add(
                                                new Paragraph("Description").setFont(font).setFontSize(12).setBold())
                                                .setTextAlignment(TextAlignment.CENTER);
                                productOrderTable.addCell(cell);
                                cell = new Cell().add(new Paragraph("Qty Sold").setFont(font).setFontSize(12).setBold())
                                                .setTextAlignment(TextAlignment.CENTER);
                                productOrderTable.addCell(cell);
                                cell = new Cell().add(new Paragraph("Price").setFont(font).setFontSize(12).setBold())
                                                .setTextAlignment(TextAlignment.CENTER);
                                productOrderTable.addCell(cell);
                                cell = new Cell().add(
                                                new Paragraph("Ext. Price").setFont(font).setFontSize(12).setBold())
                                                .setTextAlignment(TextAlignment.CENTER);
                                productOrderTable.addCell(cell);
                                for (PurchaseOrderLineitem line : poReport.getItems()) {
                                        Optional<Product> prodOpt = productRepository.findById(line.getProductid());
                                        if (prodOpt.isPresent()) {
                                                Product product = prodOpt.get();
                                                cell = new Cell()
                                                                .add(new Paragraph(product.getId()).setFont(font)
                                                                                .setFontSize(12))
                                                                .setTextAlignment(TextAlignment.CENTER);
                                                productOrderTable.addCell(cell);
                                                cell = new Cell()
                                                                .add(new Paragraph(product.getName()).setFont(font)
                                                                                .setFontSize(12))
                                                                .setTextAlignment(TextAlignment.CENTER);
                                                productOrderTable.addCell(cell);
                                                cell = new Cell()
                                                                .add(new Paragraph(String.valueOf(line.getQty()))
                                                                                .setFont(font).setFontSize(12))
                                                                .setTextAlignment(TextAlignment.RIGHT);
                                                productOrderTable.addCell(cell);
                                                normalprice = line.getPrice();
                                                cell = new Cell()
                                                                .add(new Paragraph(formatter.format(normalprice))
                                                                                .setFont(font).setFontSize(12))
                                                                .setTextAlignment(TextAlignment.RIGHT);
                                                productOrderTable.addCell(cell);
                                                ext = line.getPrice().multiply(BigDecimal.valueOf(line.getQty()),
                                                                new MathContext(8, RoundingMode.UP));
                                                cell = new Cell()
                                                                .add(new Paragraph(formatter.format(ext)).setFont(font)
                                                                                .setFontSize(12))
                                                                .setTextAlignment(TextAlignment.RIGHT);
                                                productOrderTable.addCell(cell);
                                                sub = sub.add(ext, new MathContext(8, RoundingMode.UP));
                                        }
                                }

                                cell = new Cell(1, 4).add(new Paragraph("Sub Total:")).setBorder(Border.NO_BORDER)
                                                .setTextAlignment(TextAlignment.RIGHT);
                                productOrderTable.addCell(cell);
                                cell = new Cell().add(new Paragraph(formatter.format(sub)))
                                                .setTextAlignment(TextAlignment.RIGHT);
                                productOrderTable.addCell(cell);
                                cell = new Cell(1, 4).add(new Paragraph("Tax:")).setBorder(Border.NO_BORDER)
                                                .setTextAlignment(TextAlignment.RIGHT);
                                productOrderTable.addCell(cell);
                                tax = sub.multiply(BigDecimal.valueOf(0.13), new MathContext(8, RoundingMode.UP));
                                cell = new Cell().add(new Paragraph(formatter.format(tax)))
                                                .setTextAlignment(TextAlignment.RIGHT);
                                productOrderTable.addCell(cell);
                                cell = new Cell(1, 4).add(new Paragraph("PO Total:")).setBorder(Border.NO_BORDER)
                                                .setTextAlignment(TextAlignment.RIGHT);
                                productOrderTable.addCell(cell);
                                tot = sub.add(tax, new MathContext(8, RoundingMode.UP));
                                cell = new Cell().add(new Paragraph(formatter.format(tot)))
                                                .setTextAlignment(TextAlignment.RIGHT)
                                                .setBackgroundColor(ColorConstants.YELLOW);
                                productOrderTable.addCell(cell);
                                document.add(productOrderTable);

                                document.add(new Paragraph("\n\n"));

                                String formatDateTime = format.format(poReport.getPodate());
                                document.add(new Paragraph(String.valueOf(formatDateTime))
                                                .setTextAlignment(TextAlignment.CENTER));

                                Image qrCodeImage = addSummaryQRCode(vendor, poReport);
                                document.add(qrCodeImage);
                        }
                        document.add(new Paragraph("\n\n"));

                        document.close();

                } catch (

                Exception ex) {
                        Logger.getLogger(ReportPDFGenerator.class.getName()).log(Level.SEVERE, null,
                                        ex);
                }

                return new ByteArrayInputStream(baos.toByteArray());
        }

        private static Image addSummaryQRCode(Vendor vendor, PurchaseOrder order) {

                QRCodeGenerator qrCodeGenerator = new QRCodeGenerator();
                byte[] qrCodeBin = qrCodeGenerator.generateQRCode(
                                "Summary for Purchase Order:" + order.getId()
                                                + "\nDate:" + format.format(order.getPodate())
                                                + "\nVendor:" + vendor.getName()
                                                + "\nTotal:" + formatter.format(tot));

                return new Image(ImageDataFactory.create(qrCodeBin))
                                .scaleAbsolute(100, 100)
                                .setFixedPosition(460, 60);
        }
}