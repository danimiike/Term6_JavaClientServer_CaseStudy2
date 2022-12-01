
package com.info5059.casestudy.report;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.info5059.casestudy.product.ProductRepository;
import com.info5059.casestudy.purchase.PurchaseOrderRepository;
import com.info5059.casestudy.vendor.VendorRepository;
import com.itextpdf.io.exceptions.IOException;

import java.io.ByteArrayInputStream;

import javax.servlet.http.HttpServletRequest;

//@CrossOrigin
@RestController
public class ReportPDFController {
        @Autowired
        private VendorRepository vendorRepository;
        @Autowired
        private PurchaseOrderRepository purchaseRepository;
        @Autowired
        private ProductRepository productRepository;

        @RequestMapping(value = "/POPDF", method = RequestMethod.GET, produces = MediaType.APPLICATION_PDF_VALUE)
        public ResponseEntity<InputStreamResource> streamPDF(HttpServletRequest request)
                        throws IOException, java.io.IOException {
                String poid = request.getParameter("poid");
                ByteArrayInputStream bis = ReportPDFGenerator.generateReport(poid,
                                purchaseRepository, vendorRepository, productRepository);
                HttpHeaders headers = new HttpHeaders();
                headers.add("Content-Disposition", "inline; filename=poreport.pdf");
                return ResponseEntity
                                .ok()
                                .headers(headers)
                                .contentType(MediaType.APPLICATION_PDF)
                                .body(new InputStreamResource(bis));
        }
}