//! Classification never includes response headers, bodies, request URLs or keys.
pub fn authentication_rejected(error: &tokio_tungstenite::tungstenite::Error) -> bool {
    matches!(error, tokio_tungstenite::tungstenite::Error::Http(response)
        if matches!(response.status().as_u16(), 401 | 403))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn authenticated_handshake_rejections_are_not_network_failures() {
        for (status, rejected) in [(401, true), (403, true), (429, false), (500, false)] {
            let response = tokio_tungstenite::tungstenite::http::Response::builder()
                .status(status)
                .body(None)
                .unwrap();
            assert_eq!(
                authentication_rejected(&tokio_tungstenite::tungstenite::Error::Http(Box::new(
                    response
                ))),
                rejected
            );
        }
        assert!(!authentication_rejected(
            &tokio_tungstenite::tungstenite::Error::ConnectionClosed
        ));
    }
}
